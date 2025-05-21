"""create candidatos table

Revision ID: create_candidatos_table
Revises: previous_revision
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'create_candidatos_table'
down_revision = 'previous_revision'
branch_labels = None
depends_on = None

def upgrade():
    # Cria a tabela de candidatos
    op.create_table(
        'candidatos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('empresa_id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(length=100), nullable=False),
        sa.Column('sobrenome', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('cpf', sa.String(length=14), nullable=False),
        sa.Column('data_nascimento', sa.Date(), nullable=False),
        sa.Column('telefone', sa.String(length=20), nullable=False),
        sa.Column('foto', sa.String(length=255)),
        sa.Column('endereco', sa.Text()),
        sa.Column('linkedin', sa.String(length=255)),
        sa.Column('portfolio', sa.String(length=255)),
        sa.Column('resumo', sa.Text()),
        sa.Column('senha', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Boolean(), server_default='true'),
        sa.Column('data_criacao', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('data_atualizacao', sa.DateTime(timezone=True), onupdate=sa.text('now()')),
        sa.ForeignKeyConstraint(['empresa_id'], ['empresas.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Cria índices
    op.create_index(op.f('ix_candidatos_id'), 'candidatos', ['id'], unique=False)
    op.create_index(op.f('ix_candidatos_email_empresa'), 'candidatos', ['email', 'empresa_id'], unique=True)
    op.create_index(op.f('ix_candidatos_cpf_empresa'), 'candidatos', ['cpf', 'empresa_id'], unique=True)
    
    # Cria partição por empresa_id
    op.execute("""
        CREATE TABLE candidatos_partitioned (
            LIKE candidatos INCLUDING ALL
        ) PARTITION BY LIST (empresa_id);
    """)
    
    # Cria partições para empresas existentes
    op.execute("""
        INSERT INTO candidatos_partitioned
        SELECT * FROM candidatos;
    """)
    
    # Renomeia tabelas
    op.execute("""
        ALTER TABLE candidatos RENAME TO candidatos_old;
        ALTER TABLE candidatos_partitioned RENAME TO candidatos;
    """)
    
    # Adiciona trigger para atualização automática de data_atualizacao
    op.execute("""
        CREATE OR REPLACE FUNCTION update_data_atualizacao()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.data_atualizacao = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        CREATE TRIGGER update_candidato_data_atualizacao
            BEFORE UPDATE ON candidatos
            FOR EACH ROW
            EXECUTE FUNCTION update_data_atualizacao();
    """)

def downgrade():
    # Remove trigger
    op.execute("""
        DROP TRIGGER IF EXISTS update_candidato_data_atualizacao ON candidatos;
        DROP FUNCTION IF EXISTS update_data_atualizacao();
    """)
    
    # Restaura tabela original
    op.execute("""
        ALTER TABLE candidatos RENAME TO candidatos_partitioned;
        ALTER TABLE candidatos_old RENAME TO candidatos;
    """)
    
    # Remove partições
    op.execute("""
        DROP TABLE IF EXISTS candidatos_partitioned;
    """)
    
    # Remove índices
    op.drop_index(op.f('ix_candidatos_cpf_empresa'), table_name='candidatos')
    op.drop_index(op.f('ix_candidatos_email_empresa'), table_name='candidatos')
    op.drop_index(op.f('ix_candidatos_id'), table_name='candidatos')
    
    # Remove tabela
    op.drop_table('candidatos') 