
import React from 'react';
import TelaConta from '../components/TelaConta';

export default function Comentarios() {
  return (
    <TelaConta
      titulo="Comentários e Avaliações"
      subtitulo="Consulte as avaliações relacionadas aos seus serviços."
      ativo="Comentários"
      tipo="avaliacoes"
      dados={[
        { id: '1', titulo: 'Carlos Silva', descricao: 'Excelente atendimento e projeto bem elaborado.' },
        { id: '2', titulo: 'Juliana Martins', descricao: 'Ótima comunicação e entrega dentro do prazo.' },
        { id: '3', titulo: 'Fernanda Lima', descricao: 'Profissional atenciosa e organizada.' },
      ]}
    />
  );
}
