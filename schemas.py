from pydantic import BaseModel, model_validator
from typing import Optional

class DivergenciaBase(BaseModel):
    sku: str
    quantidade: int
    categoria: str
    subcategoria: Optional[str] = None
    valor_compra: Optional[float] = None

    @model_validator(mode='after')
    def validar_regras_negocio(self) -> 'DivergenciaBase':
        categorias_validas = ['Falta', 'Sobra', 'Defeito']
        if self.categoria not in categorias_validas:
            raise ValueError(f'Categoria inválida. Opções: {categorias_validas}')

        if self.categoria == 'Defeito':
            if self.subcategoria not in ['Sobra', 'Contém no Estoque']:
                raise ValueError('Para "Defeito", a subcategoria deve ser "Sobra" ou "Contém no Estoque".')
        else:
            self.subcategoria = None
            self.valor_compra = None
            
        return self

class DivergenciaCreate(DivergenciaBase):
    pass

class DivergenciaResponse(DivergenciaBase):
    id: int

    class Config:
        from_attributes = True