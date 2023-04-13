import React, { FC, useContext } from 'react'
import { useState } from 'react'
import { Context } from '../..'
import { observer } from 'mobx-react-lite'

const LogInForm: FC = () => {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { store } = useContext(Context)

  console.log(store.isAuth)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder='Email' />
        <input value={password} onChange={e => setPassword(e.target.value)} type="text" placeholder='Password' />
        <button onClick={() => store.login(email, password)}>Войти</button>
        <button onClick={() => store.registration(email, password)}>Зарегестрироваться</button>
      </form>
    </div>
  )
}

export default observer(LogInForm);