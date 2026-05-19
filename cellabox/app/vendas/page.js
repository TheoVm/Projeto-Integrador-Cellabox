"use client";

import { useEffect, useMemo, useState } from 'react';
import { getClientes, getProdutos, createPedido } from '@/services/back4app';
import { getPackagingId } from '../utils/packaging';
import VendasClient from '../components/VendasClient';
import styles from './page.module.css';

export default function Vendas() {
  return (
    <VendasClient />
  );
}
