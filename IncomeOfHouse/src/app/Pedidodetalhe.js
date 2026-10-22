
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import TelaConta from '../components/TelaConta';

export default function Pedidodetalhe() {
  const params = useLocalSearchParams();

  return (
    <TelaConta
      titulo="Detalhes do Pedido"
      subtitulo={`Pedido #${params.id || '1'} · ${params.status || 'Em andamento'}`}
      ativo="Meus Pedidos"
      tipo="detalhe"
      dados={[
        { id: '1', titulo: 'Projeto', descricao: params.titulo || 'Projeto Arquitetônico Residencial' },
        { id: '2', titulo: 'Profissional responsável', descricao: params.profissional || 'Profissional não informado' },
        { id: '3', titulo: 'Descrição', descricao: params.descricao || 'Detalhes do serviço contratado.' },
        { id: '4', titulo: 'Status', descricao: params.status || 'Em andamento' },
      ]}
    />
  );
}
