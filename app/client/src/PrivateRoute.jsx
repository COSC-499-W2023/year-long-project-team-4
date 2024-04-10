import { Navigate, Outlet} from 'react-router-dom'
import { loginPath } from './Path'
const PrivateRoute = ({currentUser}) => {
    
  return (
    currentUser ? <Outlet/> : <Navigate to={loginPath} />
  )
}

export default PrivateRoute