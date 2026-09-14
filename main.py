import io
import csv
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Controle de Divergências")

@app.get("/api/estatisticas/")
def obter_estatisticas(db: Session = Depends(get_db)):
    total = db.query(models.Divergencia).count()
    faltas = db.query(models.Divergencia).filter(models.Divergencia.categoria == 'Falta').count()
    sobras = db.query(models.Divergencia).filter(models.Divergencia.categoria == 'Sobra').count()
    defeitos = db.query(models.Divergencia).filter(models.Divergencia.categoria == 'Defeito').count()
    return {"total": total, "faltas": faltas, "sobras": sobras, "defeitos": defeitos}

@app.get("/api/exportar/excel")
def exportar_excel(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    import io
    import openpyxl
    from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
    from fastapi.responses import StreamingResponse
    from datetime import datetime, timedelta, timezone

    fuso_br = timezone(timedelta(hours=-3))
    agora = datetime.now(fuso_br)
    data_hora_br = agora.strftime("%d/%m/%Y às %H:%M:%S")
    data_hora_arquivo = agora.strftime("%d-%m-%Y_%H-%M")

    query = db.query(models.Divergencia)
    if categoria:
        query = query.filter(models.Divergencia.categoria == categoria)
    divergencias = query.all()
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Divergências"

    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    
    titulo_relatorio = "RELATÓRIO DE DIVERGÊNCIAS DE PEÇAS"
    if categoria:
        titulo_relatorio += f" - {categoria.upper()}"

    ws.merge_cells('A1:E1')
    title_cell = ws['A1']
    title_cell.value = titulo_relatorio
    title_cell.font = Font(size=14, bold=True, color="FFFFFF")
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    title_cell.fill = PatternFill(start_color="1A1A1A", end_color="1A1A1A", fill_type="solid")
    ws.row_dimensions[1].height = 30

    headers = ["ID", "SKU (Part Number)", "Quantidade", "Categoria", "Subcategoria"]
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=2, column=col_num)
        cell.value = header
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="D50000", end_color="D50000", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")

    borda_estilo = Side(style='thin', color="CCCCCC")
    borda = Border(left=borda_estilo, right=borda_estilo, top=borda_estilo, bottom=borda_estilo)

    for row_num, d in enumerate(divergencias, 3):
        ws.cell(row=row_num, column=1, value=d.id).border = borda
        ws.cell(row=row_num, column=2, value=d.sku).border = borda
        ws.cell(row=row_num, column=3, value=d.quantidade).border = borda
        ws.cell(row=row_num, column=4, value=d.categoria).border = borda
        ws.cell(row=row_num, column=5, value=d.subcategoria or '-').border = borda
        
        ws.cell(row=row_num, column=1).alignment = Alignment(horizontal="center")
        ws.cell(row=row_num, column=3).alignment = Alignment(horizontal="center")
        ws.cell(row=row_num, column=4).alignment = Alignment(horizontal="center")

    ultima_linha = ws.max_row + 1 if divergencias else 3
    
    ws.merge_cells(start_row=ultima_linha, start_column=1, end_row=ultima_linha, end_column=5)
    rodape_cell = ws.cell(row=ultima_linha, column=1)
    rodape_cell.value = f"Documento gerado em: {data_hora_br}"
    rodape_cell.font = Font(italic=True, size=10, color="555555")
    rodape_cell.alignment = Alignment(horizontal="right", vertical="center")
    ws.row_dimensions[ultima_linha].height = 25

    ws.column_dimensions['A'].width = 8
    ws.column_dimensions['B'].width = 25
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 25

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    nome_filtro = f"_{categoria.lower()}" if categoria else ""
    nome_arquivo = f"relatorio_divergencias{nome_filtro}_{data_hora_arquivo}.xlsx"
    
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        headers={"Content-Disposition": f"attachment; filename={nome_arquivo}"}
    )

@app.post("/api/divergencias/", response_model=schemas.DivergenciaResponse)
def criar_divergencia(div: schemas.DivergenciaCreate, db: Session = Depends(get_db)):
    db_div = models.Divergencia(**div.model_dump())
    db.add(db_div)
    db.commit()
    db.refresh(db_div)
    return db_div

@app.get("/api/divergencias/", response_model=List[schemas.DivergenciaResponse])
def listar_divergencias(sku: Optional[str] = None, categoria: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Divergencia)
    if sku:
        query = query.filter(models.Divergencia.sku.icontains(sku))
    if categoria:
        query = query.filter(models.Divergencia.categoria == categoria)
    return query.all()

@app.put("/api/divergencias/{div_id}", response_model=schemas.DivergenciaResponse)
def atualizar_divergencia(div_id: int, div: schemas.DivergenciaCreate, db: Session = Depends(get_db)):
    db_div = db.query(models.Divergencia).filter(models.Divergencia.id == div_id).first()
    if not db_div:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    for key, value in div.model_dump().items():
        setattr(db_div, key, value)
    db.commit()
    db.refresh(db_div)
    return db_div

@app.delete("/api/divergencias/{div_id}")
def deletar_divergencia(div_id: int, db: Session = Depends(get_db)):
    db_div = db.query(models.Divergencia).filter(models.Divergencia.id == div_id).first()
    if not db_div:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    db.delete(db_div)
    db.commit()
    return {"message": "Registro excluído"}

app.mount("/", StaticFiles(directory="static", html=True), name="static")