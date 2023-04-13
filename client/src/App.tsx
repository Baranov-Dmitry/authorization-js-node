import React, { useContext, useEffect, useState } from 'react';
import LogInForm from './component/logInFrom/LogInForm';
import { Context } from '.';
import { IUser } from './models/IUser';
import { observer } from 'mobx-react-lite';
import UserService from './services/UserService';

function App() {

  const { store } = useContext(Context)
  const [users, setUsers] = useState<IUser[]>([])

  async function getUsers() {
    try {
      const response = await UserService.getUsers()
      setUsers(response.data)
    } catch (error) {
      console.log(error)
    }

  }

  useEffect(() => {
    console.log(localStorage.getItem('token'))
    if (localStorage.getItem('token')) {
      store.checkAuth()
    }
  }, [])

  if (store.isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="App">
      <h1>{store.isAuth ? `Пользователь аворизован ${store.user.email}` : "Авторизуйтесь"}</h1>
      {!store.isAuth
        ? <>
          <LogInForm />
        </>
        : <>
          <h1>{store.user.isActivate ? `Почта подтверждена` : "Подтвердите почту"}</h1>
          <div><button onClick={() => store.logout()}>Выйдти</button></div>
          <div><button onClick={getUsers}>Показать всех пользователей</button></div>
        </>
      }
      {users.map(user => <div key={user.email}>{user.email}</div>)}
    </div>
  );
}

export default observer(App);
