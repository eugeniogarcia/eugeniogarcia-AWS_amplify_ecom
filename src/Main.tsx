import React, { useState, useEffect } from 'react'
import Container from './Container'
import { API } from 'aws-amplify'
import { List } from 'antd'
import checkUser from './checkUser'

import { usuario } from './checkUser'

type producto={
    id:string
    name:string,
    price:number
}

function Main() {
    //Este estado guarda la lista de productos
    const [state, setState] = useState({ products: [] as producto[] , loading: true })

    //En este estado guardamos los datos de usuario
    const [user, updateUser] = useState({} as usuario)
    
    let didCancel = false

    useEffect(() => {
        getProducts()
        checkUser(updateUser)
        return () => {didCancel = true}
    }, [])
    
    async function getProducts() {
        try {
            //No se pasan argumento
            const data = await API.get('ecommerceapi', '/products', null)
            console.log('data: ', data)
            if (didCancel) return
            setState({
                products: data.data.Items, loading: false
            })
        } catch (err) {
            console.log('error: ', err)
        }
    }
    
    async function deleteItem(id:string) {
        try {
            const products = state.products.filter(p => p.id !== id)
            setState({ ...state, products })
            await API.del('ecommerceapi', '/products', { body: { id } })
            console.log('successfully deleted item')
        } catch (err) {
            console.log('error: ', err)
        }
    }

    return (
        <Container>
            <List
                itemLayout="horizontal"
                dataSource={state.products}
                loading={state.loading}
                renderItem={item => (
                    <List.Item
                        //@ts-ignore
                        actions={user.isAuthorized ? [<p onClick={() => deleteItem(item.id)} key={item.id}>delete</p>]: null}
                    >
                        <List.Item.Meta
                            title={item.name}
                            description={item.price}
                        />
                    </List.Item>
                )}
            />
        </Container>
    )
}
export default Main