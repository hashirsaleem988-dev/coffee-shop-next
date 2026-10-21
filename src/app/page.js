import Navbar from "../components/navbar/navbar";
import Hero from "../components/hero/hero";
import Statusbar from "../components/statusbar/statusbar";
import About from "../components/about/about";
import Menu from "../components/menu/menu";
import Footer from "@/components/footer/footer";
export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Statusbar />
        <About />
        <Menu />
        <Footer />
      </main>
    </>
  );
}