from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal

class DivergenciaBase(BaseModel):
    sku: str = Field(..., min_length=2, max_length=50, pattern=r'^[a-zA-Z0-9-_]+$')
    quantidade: int = Field(..., ge=1, le=10000)
    categoria: Literal['Falta', 'Sobra', 'Defeito']
    subcategoria: str = Field(..., min_length=2, max_length=100)
    valor_compra: Optional[float] = Field(None, ge=0.0, le=1000000.0)

class DivergenciaCreate(DivergenciaBase):
    @model_validator(mode='after')
    def validar_regras_negocio(self) -> 'DivergenciaCreate':
        if self.categoria != 'Defeito':
            self.valor_compra = None
            
        regras = {
            'Falta': ['OS 17207', 'Estoque'],
            'Sobra': ['OS 17207', 'Estoque'],
            'Defeito': ['Avaria', 'Garantia', 'Fábrica'] 
        }
        
        if self.categoria in regras and self.subcategoria not in regras[self.categoria]:
            if not self.subcategoria.endswith("(Registro Antigo)"):
                raise ValueError(f"Subcategoria '{self.subcategoria}' é inválida para '{self.categoria}'.")
            
        return self

class DivergenciaResponse(DivergenciaBase):
    id: int

    class Config:
        from_attributes = True