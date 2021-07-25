import { Auth } from 'aws-amplify'

export type usuario = {
    isAuthorized: boolean,
    username: string
}

//La comprobación del usuario significa...
async function checkUser(updateUser: React.Dispatch<React.SetStateAction<usuario>>) {
    //Obtener el principal usando la api de auth
    const userData = await Auth
        .currentSession()
        .catch(err => console.log('error: ', err)
        )

    //Si no hay datos de usuario, limpiamos el estado
    if (!userData) {
        console.log('userData: ', userData)
        updateUser({}as usuario)
        return
    }

    //Obtenemos el token
    const payload = userData.getIdToken().payload
    //COmprobamos si el usario pertenece a Admin para saber si está autorizado o no
    const isAuthorized =
        // @ts-ignore
        payload['cognito:groups'] &&
        // @ts-ignore
        payload['cognito:groups'].includes('Admin')
    
    //Actualizamos el estado
    updateUser({
        // @ts-ignore
        username: payload['cognito:username'],
        isAuthorized
    })
}

export default checkUser