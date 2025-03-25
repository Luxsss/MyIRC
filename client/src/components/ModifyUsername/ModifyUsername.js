
function Title (){
    return(
        <h1 className="text-3xl pb-8 flex justify-center">
            Modify your username
        </h1>
    )
}

function MyButton() {
    return (
      <button className="bg-white hover:bg-green-400 rounded-md border-2 border-white hover:py-0.5 m-3">modify username</button>
    );
  }
  function Username(){
    return(
      <input name="Username" className="p-30"></input>
    )
  }

  export default function Login(){
    return(
      <div className="h-screen w-screen flex justify-center items-center py-10% ">
          <ul className="bg-zinc-500 rounded">
        <li className="mt-4 mx-14 flex justify-center "><Title/></li>
        <li className="m-t2 mx-14 flex justify-center "><Username/></li>
        <li className="my-4 mx-14  flex justify-center "><MyButton/></li>
          </ul>
      </div>
    )
}