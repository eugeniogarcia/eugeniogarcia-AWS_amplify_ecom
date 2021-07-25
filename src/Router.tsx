import React, { useState, useEffect } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Nav from './Nav'
import Admin from './Admin'
import Main from './Main'
import Profile from './Profile'

export default function Router() {
    //Guardamos en el estado cual es el componente activo
    const [current, setCurrent] = useState('home')

    //Añadimos un listener para comprobar cuando cambia la ubicación de la ventana, actualiza el estado
    useEffect(() => {
        setRoute()
        window.addEventListener('hashchange', setRoute)
        return () => window.removeEventListener('hashchange', setRoute)
    }, [])

    //Obtiene la ruta y cambia el estado
    function setRoute() {
        const location = window.location.href.split('/')
        const pathname = location[location.length - 1]
        console.log('pathname: ', pathname)
        setCurrent(pathname ? pathname : 'home')
    }

    return (
        <HashRouter>
            <Nav current={current} />
            <Switch>
                <Route exact path='/' component={Main} />
                <Route path='/admin' component={Admin} />
                <Route path='/profile' component={Profile} />
                <Route component={Main} />
            </Switch>
        </HashRouter>
    )
}