"""add pipeline movimentacoes

Revision ID: add_pipeline_movimentacoes
Revises: previous_revision
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_pipeline_movimentacoes'
down_revision = 'previous_revision'  # Substitua pelo ID da última revisão
branch_labels = None
depends_on = None

def upgrade():
    # Cria tabela de movimentações
    op.create_table(
        'pipeline_movimentacoes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidato_id', sa.Integer(), nullable=False),
        sa.Column('etapa_origem_id', sa.Integer(), nullable=True),
        sa.Column('etapa_destino_id', sa.Integer(), nullable=False),
        sa.Column('responsavel_id', sa.Integer(), nullable=False),
        sa.Column('score_avaliacao', sa.Float(), nullable=True),
        sa.Column('observacao', sa.Text(), nullable=True),
        sa.Column('data_movimentacao', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['candidato_id'], ['pipeline_candidatos.id'], ),
        sa.ForeignKeyConstraint(['etapa_origem_id'], ['pipeline_etapas.id'], ),
        sa.ForeignKeyConstraint(['etapa_destino_id'], ['pipeline_etapas.id'], ),
        sa.ForeignKeyConstraint(['responsavel_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pipeline_movimentacoes_id'), 'pipeline_movimentacoes', ['id'], unique=False)

def downgrade():
    # Remove tabela de movimentações
    op.drop_index(op.f('ix_pipeline_movimentacoes_id'), table_name='pipeline_movimentacoes')
    op.drop_table('pipeline_movimentacoes') 