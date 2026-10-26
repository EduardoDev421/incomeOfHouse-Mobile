
import React from 'react';
import TelaConta from '../components/TelaConta';

export default function MeusPedidos() {
  return (
    <TelaConta
      titulo="Meus Pedidos"
      subtitulo="Acompanhe o andamento e o histórico de todos os seus pedidos."
      ativo="Meus Pedidos"
      tipo="pedidos"
      dados={[
        { id: '1', titulo: 'Projeto Arquitetônico Residencial', profissional: 'Carlos Silva · Arquiteto', descricao: 'R$ 2.800,00 · Pedido em 12/06/2025', status: 'Em andamento' },
        { id: '2', titulo: 'Reforma e Ampliação', profissional: 'Juliana Martins · Engenheira Civil', descricao: 'R$ 15.600,00 · Pedido em 28/05/2025', status: 'Concluído' },
        { id: '3', titulo: 'Consultoria de Viabilidade', profissional: 'Rafael Costa', descricao: 'R$ 950,00 · Pedido em 15/05/2025', status: 'Cancelado' },
        { id: '4', titulo: 'Planta Baixa - Sobrado', profissional: 'Fernanda Lima · Arquiteta', descricao: 'R$ 1.750,00 · Pedido em 03/05/2025', status: 'Concluído' },
        { id: '5', titulo: 'Projeto de Interiores', profissional: 'Lucas Pereira', descricao: 'R$ 3.400,00 · Pedido em 20/04/2025', status: 'Em andamento' },
      ]}
    />
  );
}
