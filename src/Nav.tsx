import React, { useState, useEffect, FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'
import { HomeOutlined, UserOutlined, ProfileOutlined } from '@ant-design/icons'
import { Hub } from 'aws-amplify'
import checkUser from './checkUser'

import { usuario } from './checkUser'

type propiedades = {
    current: string
}

const Nav: FunctionComponent<propiedades> = (props: propiedades) => {
    const { current } = props
    //Guardamos el usuario
    const [user, updateUser] = useState({} as usuario)

    useEffect(() => {
        //Verificamos el usuario
        checkUser(updateUser)

        //Nos subscribimos al evento auth del Hub
        Hub.listen('auth', (data) => {
            //Obtenemos los datos del evento
            const { payload: { event } } = data;
            console.log('event: ', event)
            //Si cambio el estado, comprobamos de nuevo si tenemos permisos
            if (event === 'signIn' || event === 'signOut') checkUser(updateUser)
        })
    }, [])
    
    //Muestra un menu con los componentes
    return (
        <div>
            <Menu selectedKeys={[current]} mode="horizontal">
                <Menu.Item key='home'>
                    <Link to={`/`}>
                        <HomeOutlined />Home
                    </Link>
                </Menu.Item>
                <Menu.Item key='profile'>
                    <Link to='/profile'>
                        <UserOutlined />Profile
                    </Link>
                </Menu.Item>
                {
                    user.isAuthorized && (
                        <Menu.Item key='admin'>
                            <Link to='/admin'>
                                <ProfileOutlined />Admin
                            </Link>
                        </Menu.Item>
                    )
                }
            </Menu>
        </div>
    )
}
export default Nav