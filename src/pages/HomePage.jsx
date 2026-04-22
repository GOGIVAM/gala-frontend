import Hero from '../components/Hero/Hero.jsx'
import ProgramWheel from '../components/Program/ProgramWheel.jsx'
import Tickets from '../components/Tickets/Tickets.jsx'
import Awards from '../components/Awards/Awards.jsx'
import Info from '../components/Info/Info.jsx'
import Recruitment from '../components/Recruitment/Recruitment.jsx'

// Divider component
function GoldDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px', overflow: 'hidden' }}>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.3))' }} />
      <div style={{ margin: '0 20px', color: 'rgba(201,168,76,0.4)', fontSize: '10px' }}>✦</div>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.3))' }} />
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <GoldDivider />
      <ProgramWheel />
      <GoldDivider />
      <Tickets />
      <GoldDivider />
      <Awards />
      <GoldDivider />
      <Info />
      <GoldDivider />
      <Recruitment />
    </main>
  )
}
