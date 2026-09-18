from sqlalchemy import Column, Integer, String, Float
from database import Base

class Usuario(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="operador", nullable=False)

class Divergencia(Base):
    __tablename__ = "divergencias"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), index=True, nullable=False)
    quantidade = Column(Integer, nullable=False)
    categoria = Column(String(50), nullable=False)
    subcategoria = Column(String(100), nullable=False)
    valor_compra = Column(Float, nullable=False)