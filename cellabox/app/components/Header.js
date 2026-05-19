'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Início' },
    { href: '/vendas', label: 'Vendas' },
    { href: '/financas', label: 'Finanças' },
    { href: '/clientes', label: 'Clientes' },
    { href: '/ingredientes', label: 'Ingredientes' },
    { href: '/produtos-embalagens', label: 'Produtos e Embalagens' },
  ];

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label="Cellabox">
        <Image
          src="/Logo.png"
          alt="Cellabox Logo"
          width={85}
          height={83}
          className={styles.logo}
          priority
        />
        <span>Cella Box</span>
      </Link>

      <nav className={styles.nav}>
        {links.map((link) => {
          const active = link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? styles.active : ''}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
