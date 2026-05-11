import { Link } from 'react-router-dom'

export const Home = () => {
    return (
        <div>
            <Link to={'/About'} className='bg-gray-700 block'>About</Link>
            <div className='text-blue-400 '>hellos
            </div>
        </div>
    )
}
