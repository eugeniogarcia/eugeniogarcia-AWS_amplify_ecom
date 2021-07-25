import React, { useState } from 'react'
import './App.css'
import { Input, Button } from 'antd'
import { API } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'

const initialState = {
    name: '', price: ''
}

function Admin() {
    //Guarda en el estado el nombre y el precio
    const [itemInfo, updateItemInfo] = useState(initialState)

    //Helper para actualizar el estado
    function updateForm(e: React.ChangeEvent<HTMLInputElement>) {
        //Actualiza la propiedad indicada en el evento, el resto quedan como estaban
        const formData = {
            ...itemInfo, [e.target.name]: e.target.value
        }
        updateItemInfo(formData)
    }

    //Registra el producto en la base de datos y limpia el estado
    async function addItem() {
        try {
            const data = {
                body: { ...itemInfo, price: parseInt(itemInfo.price) }
            }
            //Llama a la api
            await API.post('ecommerceapi', '/products', data)
            updateItemInfo(initialState)
        } catch (err) {
            console.log('error adding item...')
        }

    }
    return (
        <div style={containerStyle}>
            <Input
                name='name'
                onChange={updateForm}
                value={itemInfo.name}
                placeholder='Item name'
                style={inputStyle}
            />
            <Input
                name='price'
                onChange={updateForm}
                value={itemInfo.price}
                style={inputStyle}
                placeholder='item price'
            />
            <Button
                style={buttonStyle}
                onClick={addItem}
            >Add Product</Button>
        </div>
    )
}
const containerStyle = { width: 400, margin: '20px auto' }
const inputStyle = { marginTop: 10 }
const buttonStyle = { marginTop: 10 }

//Recurso protegido
export default withAuthenticator(Admin)