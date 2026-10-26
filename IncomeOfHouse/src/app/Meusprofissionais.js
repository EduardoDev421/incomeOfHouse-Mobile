
import React from 'react';
import TelaConta from '../components/TelaConta';

export default function Meusprofissionais() {
  return (
    <TelaConta
      titulo="Meus Profissionais Favoritos"
      subtitulo="Encontre rapidamente os profissionais que você salvou."
      ativo="Meus Profissionais Favoritos"
      tipo="favoritos"
      dados={[
        { id: '1', titulo: 'Carlos Silva', descricao: 'Arquiteto · Projetos residenciais' },
        { id: '2', titulo: 'Juliana Martins', descricao: 'Engenheira Civil · Reformas' },
        { id: '3', titulo: 'Fernanda Lima', descricao: 'Arquiteta · Plantas e interiores' },
        { id: '4', titulo: 'Lucas Pereira', descricao: 'Designer de interiores' },
      ]}
    />
  );
}
