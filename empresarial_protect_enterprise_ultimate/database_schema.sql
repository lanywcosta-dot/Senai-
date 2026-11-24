-- =====================================================================
-- EMPRESARIAL PROTECT - SCRIPT DE BANCO DE DADOS RELACIONAL (POSTGRESQL)
-- =====================================================================

CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE setores (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

CREATE TABLE colaboradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    setor_id INT REFERENCES setores(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipamentos_epi (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    ca_numero VARCHAR(50) UNIQUE NOT NULL,
    quantidade_estoque INT NOT NULL CHECK (quantidade_estoque >= 0),
    data_validade_lote DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entregas_epis (
    id SERIAL PRIMARY KEY,
    codigo_registro VARCHAR(20) UNIQUE NOT NULL,
    colaborador_id INT REFERENCES colaboradores(id) ON DELETE CASCADE,
    epi_id INT REFERENCES equipamentos_epi(id) ON DELETE CASCADE,
    data_entrega DATE NOT NULL,
    assinatura_digital VARCHAR(255) NOT NULL,
    status_conformidade VARCHAR(50) DEFAULT 'NR-6 CONFORME',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treinamentos_nr6 (
    id SERIAL PRIMARY KEY,
    tema VARCHAR(150) NOT NULL,
    publico_alvo VARCHAR(150) NOT NULL,
    carga_horaria_horas INT NOT NULL,
    status_turma VARCHAR(50) DEFAULT 'AGENDADO',
    data_realizacao DATE
);

-- Índices para performance
CREATE INDEX idx_colaboradores_setor ON colaboradores(setor_id);
CREATE INDEX idx_entregas_colaborador ON entregas_epis(colaborador_id);
CREATE INDEX idx_epis_ca ON equipamentos_epi(ca_numero);
