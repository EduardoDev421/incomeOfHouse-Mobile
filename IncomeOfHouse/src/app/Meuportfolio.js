
import React from 'react';
import TelaConta from '../components/TelaConta';

export default function Meuportfolio() {
  return (
    <TelaConta
      titulo="Meu Portfólio"
      subtitulo="Apresente seus trabalhos e projetos realizados."
      ativo="Meu Portfólio"
      tipo="portfolio"
      dados={[
        { id: '1', titulo: 'Casa Moderna', descricao: 'Projeto residencial contemporâneo' },
        { id: '2', titulo: 'Reforma de Apartamento', descricao: 'Projeto de interiores e iluminação' },
        { id: '3', titulo: 'Casa de Campo', descricao: 'Arquitetura integrada à natureza' },
      ]}
    />
  );
}
