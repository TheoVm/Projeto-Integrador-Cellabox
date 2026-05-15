import styles from './Header.module.css';
import Image from 'next/image';

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        src="/Logo.png"
        alt="Cellabox Logo"
        width={85}
        height={83}
        className={styles.logo}
      />
      <div className={styles.navContainer}>
        <nav className={styles.nav}>
          <a href="/vendas">Vendas</a>
          <a href="/financas">Finanças</a>
          <a href="/clientes">Clientes</a>
          <a href="/ingredientes">Ingredientes</a>
          <a href="/produtos-embalagens">Produtos e Embalagens</a>
        </nav>
      </div>
    </header>
  );
}