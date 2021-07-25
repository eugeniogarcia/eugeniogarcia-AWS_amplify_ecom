import React from 'react'
import './App.css'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'

function Profile() {
    return (
        <div style={containerStyle}>
            <AmplifySignOut />
        </div>
    );
}

const containerStyle = {
    width: 400,
    margin: '20px auto'
}

//Protegemos el acceso a este componente
export default withAuthenticator(Profile)