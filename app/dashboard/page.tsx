import React from 'react'
import { fuenteDeTitulo, pantallaPrincipalEstilos } from '../_styles/global-styles'
import { FiltroFechas, Graficos, HotelEstadisticas } from '@/_components'

const Dashboard = () => {
  return (
    <div className={pantallaPrincipalEstilos + " pb-40"}>
      <label className={fuenteDeTitulo}>Dashboards</label>
      <div>
        <FiltroFechas/>
        <HotelEstadisticas/>
        <Graficos/>
      </div>
    </div>
  )
}

export default Dashboard