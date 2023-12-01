import {usePageStore} from "../store";

export const NavBar = () => {
  const { decreasePage, increasePage } = usePageStore((state) => state)

  return (
    <nav className="flex justify-between">
      <ul className="flex gap-2">
        <li><a className="bg-blue-500 p-2 rounded text-black block" href="/">Home</a></li>
        <li><a className="bg-blue-500 p-2 rounded text-black block" href="/-1">Daily -1</a></li>
        <li><a className="bg-blue-500 p-2 rounded text-black block" href="/-3">Daily -3</a></li>
      </ul>
      <ul className="flex gap-2">
        <li><button onClick={decreasePage} className="bg-blue-500 p-2 rounded text-black">Last</button></li>
        <li><button onClick={increasePage} className="bg-blue-500 p-2 rounded text-black">Next</button></li>
      </ul>
    </nav>
  )
}
