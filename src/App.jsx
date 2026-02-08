import { ThemeProvider } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import Header from './components/Header';
import Screenshots from './components/Screenshots';
import Description from './components/Description';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <main>
        <Header />
        <Screenshots />
        <Description />
      </main>
      <Footer />
    </ThemeProvider>
  );
}

export default App;

