import Nav from "./components/Nav";
import Scene from "./components/Scene";
import Architecture from "./components/Architecture";
import ServiceBlocks from "./components/ServiceBlocks";
import Process from "./components/Process";
import Cases from "./components/Cases";
import Specs, { Ticker } from "./components/Specs";
import Contact, { Footer } from "./components/Contact";

export default function App() {
  return (
    <div className="relative min-h-screen bg-ink text-paper">
      <div className="noise-layer" aria-hidden="true" />
      <Nav />
      <main>
        <Scene />
        <Ticker />
        <Architecture />
        <ServiceBlocks />
        <Process />
        <Cases />
        <Specs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
