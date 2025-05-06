const Spinner = () => {

    return (
        // < div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" >
        //     <div className="spinner"></div>
        // </div >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="w-10 h-10 border-4 border-t-transparent border-[#7555F4] rounded-full animate-spin"></div>
        </div>
    )
}

export default Spinner;