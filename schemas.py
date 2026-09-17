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

        if self.categoria != 'Defeito':
            self.valor_compra = None
            
        return self

class DivergenciaCreate(DivergenciaBase):
    pass

class DivergenciaResponse(DivergenciaBase):
    id: int

    class Config:
        from_attributes = True