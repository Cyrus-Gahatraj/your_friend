import HeroSection from "./components/HeroSection";
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <HeroSection/>
      <Footer/>
    </div>
  );
}
