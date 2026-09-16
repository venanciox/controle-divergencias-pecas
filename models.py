from sqlalchemy import Column, Integer, String, Float
from database import Base

class Divergencia(Base):
    __tablename__ = "divergencias"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, index=True, nullable=False)
    quantidade = Column(Integer, nullable=False)
    categoria = Column(String, nullable=False)
    subcategoria = Column(String, nullable=True)
    valor_compra = Column(Float, nullable=True)

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)