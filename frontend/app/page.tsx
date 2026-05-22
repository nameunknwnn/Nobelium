import Footer from "./components/common/footer";
import NavigationBar from "./components/common/naviagationBar";
import AgentCatalog from "./components/landing/agentCatalog";
import HeroSection from "./components/landing/heroSection";

export default function Home() {
  return (
    <div>
      <NavigationBar />
      <HeroSection />
      <AgentCatalog/>
      <Footer/>
    </div>
  );
}
