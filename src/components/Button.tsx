import { Triangle } from 'lucide-react';
import { useState } from 'react';

const dropdowns = [
  {
    label: 'Date',
    options: ['Semaine', 'Mois', 'Année'],
  },
  {
    label: 'Horaire',
    options: ['Matin', 'Après-midi', 'Soir'],
  },
  {
    label: 'Température',
    options: ['Celsius', 'Fahrenheit'],
  },
];

const Button = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<(string | null)[]>(dropdowns.map(() => null));

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const select = (dropdownIndex: number, option: string | null) => {
    setSelected(selected.map((s, i) => (i === dropdownIndex ? option : s)));
    setOpenIndex(null);
  };

  return (
    <div className="flex justify-center items-center py-8 background-color">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 items-end">
        {dropdowns.map((dropdown, i) => (
          <div
            key={dropdown.label}
            className={`flex flex-col gap-2 relative ${i === 2 ? 'col-span-2 items-center sm:col-span-1' : ''}`}
          >
            <label className="text-white text-lg font-medium text-center">{dropdown.label}</label>
            <button
              onClick={() => toggle(i)}
              className={`
                px-21 py-2 border-2 rounded-4xl
                sm:px-25 sm:py-2 sm:border-2 sm:rounded-4xl
                md:px-26 md:py-3 md:border-2 md:rounded-4xl
                lg:px-38 lg:py-6 lg:border-2 lg:rounded-4xl
                border-[#9C95DC] text-[#9C95DC] bg-transparent
                hover:bg-[#9C95DC]/10 transition-colors
                flex items-center justify-center relative
              `}
            >
              <span className="absolute left-5 text-sm">{selected[i] ?? ''}</span>
              <Triangle
                className={`fill-[#9C95DC] absolute right-5 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : 'rotate-270'}`}
              />
            </button>

            {openIndex === i && (
              <ul className="absolute top-full mt-2 w-full bg-[#2A2A2A] border border-[#9C95DC] rounded-xl overflow-hidden z-10">
                  <li
                  onClick={() => select(i, null)}
                  className="px-4 py-2 text-[#9C95DC]/40 hover:bg-[#9C95DC]/20 cursor-pointer text-sm italic"
                >
                  Aucun
                </li>
                {dropdown.options.map((option) => (
                  <li
                    key={option}
                    onClick={() => select(i, option)}
                    className="px-4 py-2 text-[#9C95DC] hover:bg-[#9C95DC]/20 cursor-pointer text-sm"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Button;
