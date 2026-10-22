
import React from 'react';
import TelaConta from '../components/TelaConta';

export default function Meusenderecos() {
  return (
    <TelaConta
      titulo="Meus Endereços"
      subtitulo="Gerencie os endereços utilizados nos seus pedidos."
      ativo="Meus Endereços"
      tipo="enderecos"
      dados={[
        { id: '1', titulo: 'Minha casa', descricao: 'Rua das Flores, 100 · Brasília, DF' },
        { id: '2', titulo: 'Trabalho', descricao: 'Avenida Central, 250 · Brasília, DF' },
      ]}
    />
  );
}
