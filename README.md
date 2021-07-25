# Instalación

Creamos la app con React y Typescript:

```js
npx create-react-app ecommerceapp --template typescript

npm install aws-amplify @aws-amplify/ui-react react-router-dom antd @types/antd @types/react-router-dom @types/react 
```

Inicializamos Amplify, con el backend de autenticación, el de almancenamiento y crearemos también una api:

```ps
amplify init

amplify add auth

amplify add storage

amplify add api

amplify push
```

Lo más destacado de como se configuran estos backends es:

- Auth lo configuraremos con la configuración por defecto, si intengranos con otros proveedores. Usaremos el username para identificar a cada usuario, e incluiremos el email entre los datos del principal
- Storage
    - Usaremos una base de datos NoSQL (la otra posibilidad habría sido Content, que se traduce en S3)
    - Llamamos a la tabla _producttable_ y la creamos con un solo campo, _id_ de tipo _string_
    - Usamos como _partition key_ el campo _id_
    - No creamos un _sorted key_, así que eso significa que la _clave principal_ y la _partition key_ son la misma cosa
    - No creamos un _índice secundario global_
    - No vamos a crear una lambda asociada a los eventos en DynamoDB
- API
    - Sera de tipo REST - podríamos haberla creado GraphQL
    - Elegimos el recurso, _/products_
    - Creamos una lambda, con NodeJS, usando como plantilla Express (integración con el ApiGW) - otras opciones serían función CRUD con DynamoDB e integración con el ApiGW)
    - Indicamos que necesitamos que la Lambda haga uso de otros backends de este proyecto - auth y storage.
        - Indicamos los permisos que tendremos en cada backend de storage - solo tenemos uno
        - Indicamos los permisos que tendremos en el backend auth
    - Indicamos que el acceso a la propia Api este restringido a usuarios autenticados e invitados. A los autenticados les permitiremos todas las operaciones, pero a los invitados solo la lectura
    - Podríamos repetir toda esta configuración para otro path/ruta. En este caso solo crearemeos una ruta, _/products_

# Lambda

## Guardar 

Seguimos los pasos de la api que guarda un producto.

### Autenticación

La lambda se expondrá como una Api REST en el ApiGW. Para permitir el acceso, el Lambda comprobará si el principal asociado al usuario pertence al grupo _Admin_. Usamos el helper siguiente pasando el principal creado por el ApiGW y el nombre del grupo:

```js
app.post('/products', async function (req, res) {
  const { body } = req
  const { event } = req.apiGateway

  try {
    await canPerformAction(event, 'Admin')
```

El helper comprobará si el principal pertenece a Admin:

```js
async function canPerformAction(event, group) {

  return new Promise(async (resolve, reject) => {
    if (!event.requestContext.identity.cognitoAuthenticationProvider) {
      return reject()
    }
```

Si no está rellena la propiedad `cognitoAuthenticationProvider` termina. Recuperamos los grupos - más sobre este método a continuación:

```js
    //Recupera los grupos que el helper anterior
    const groupData = await getGroupsForUser(event)
    const groupsForUser = groupData.Groups.map(group => group.GroupName)
```

Y miramos si el grupo está entre la lista de grupos a los que pertence el usuario:

```js
    //Comprobamos si el grupo que buscamos en esta en la lista
    if (groupsForUser.includes(group)) {
      resolve()
    } else {
      reject('user not in group, cannot perform action..')
    }
  })
}
```

Para preguntarle a Gonito por los grupos, especificamos el pool y el token:

```js
//Helper para recuperar los grupos de un usuario
async function getGroupsForUser(event) {
  let userSub =
    event
      .requestContext
      .identity
      .cognitoAuthenticationProvider
      .split(':CognitoSignIn:')[1]

  let userParams = {
    UserPoolId: userpoolId,
    Filter: `sub = "${userSub}"`,
  }
```

y consultamos con la Api de Cognito:

```js
  //Recupera los datos del usuario consultandolo en su pool. 
  let userData = await cognito.listUsers(userParams).promise()
```

### DynamoDB

Una vez que hemos comprobado que el usuario pertenece al grupo Admin:

```js
app.post('/products', async function (req, res) {
  const { body } = req
  const { event } = req.apiGateway

  try {
    await canPerformAction(event, 'Admin')
```

Preparamos el payload para guardar en DynamoDB. Indicamos los datos, que será el payload que hemos pasado a la Api, más un _id_ que generamos. Indicamos también la tabla y usamos la Api de DynamoDB:

```js
    const input = { ...body, id: uuid() }

    var params = {
      TableName: ddb_table_name,
      Item: input
    }

    await docClient.put(params).promise()
```

__Notese que no hemos tenido que especificar ninguna credencial para usar la API de Cognito o Dynamo.__ Al crear la api indicamos que se necesitaba tener acceso a los backends _auth_ y _storage_.

## Consulta

Para consultar hacemos un scan de la tabla con la Api:

```js
async function getItems() {
  var params = { TableName: ddb_table_name }
  try {
    const data = await docClient.scan(params).promise()
    return data
  } catch (err) {
    return err
  }
}

// Recupera los items de la base de datos
app.get('/products', async function (req, res) {
  try {
    const data = await getItems()
    res.json({ data: data })
  } catch (err) {
    res.json({ error: err })
  }
})
```

## Borrar

Para borrar, despues de comprobar que el usuario pertenece al grupo Admin, tomamos el _id_ de la entrada a borrar del payload, y usamos la Api de DynamoDB:

```js
app.delete('/products', async function (req, res) {
  const { event } = req.apiGateway

  try {
    await canPerformAction(event, 'Admin')
  
    var params = {
      TableName: ddb_table_name,
      Key: { id: req.body.id }
    }
  
    await docClient.delete(params).promise()
  
    res.json({ success: 'successfully deleted item' })
  } catch (err) {
    res.json({ error: err })
  }
});
```

# Cliente

Destacar algunas cosas:
- Llamar a una de las apis del backend es sencillo, no tenemos más que hacer referencia a ella por nombre, y el framework se encarga del resto, saber donde encontrarla en el ApiGW y con que credenciales llamar
- 