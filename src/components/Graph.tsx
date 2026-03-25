export function Graph() {
    return (
        <div className="flex flex-1 justify-center items-center py-10">
            <div className="relative border-purple-300 bg-[#272727] border-4 rounded-4xl
                w-80 h-150
                sm:w-150 sm:h-120
                md:w-180 md:h-150
                lg:w-250 lg:h-150">

                <div className="absolute -top-5 left-1/2 -translate-x-1/2
                    flex gap-5 sm:gap-15 md:gap-25 lg:gap-35 w-max">
                    <button className="
                        border-purple-300 border-4 rounded-4xl
                        bg-purple-300 focus:bg-purple-400
                        px-5 py-1 sm:px-10 md:px-15 lg:px-20
                    ">
                        Ligne A
                    </button>
                    <button className="
                        border-purple-300 border-4 rounded-4xl
                        bg-purple-300 focus:bg-purple-400
                        px-5 py-1 sm:px-10 md:px-15 lg:px-20
                    ">
                        Ligne B
                    </button>
                </div>

            </div>
        </div>
    );
}