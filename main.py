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

@app.get("/api/exportar/csv")
def exportar_csv(db: Session = Depends(get_db)):
    divergencias = db.query(models.Divergencia).all()
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';') 
    writer.writerow(['ID', 'SKU', 'Quantidade', 'Categoria', 'Subcategoria'])
    
    for d in divergencias:
        writer.writerow([d.id, d.sku, d.quantidade, d.categoria, d.subcategoria or '-'])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=relatorio_divergencias.csv"}
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