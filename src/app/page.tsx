import Link from 'next/link';
import { LuArrowRight, LuUser, LuStethoscope, LuShieldCheck } from 'react-icons/lu';

// Ye card component code ko saaf rakhega
const InfoCard = ({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <Link
    href={href}
    className="group p-6 text-left border w-full max-w-sm rounded-xl transition-all
               hover:border-blue-600 hover:shadow-lg focus:border-blue-600
               bg-white shadow-md"
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <Icon className="w-8 h-8 text-blue-500" />
    </div>
    <p className="mt-2 text-lg text-gray-600">{description}</p>
    <div className="mt-4 flex items-center text-blue-600 font-semibold
                    opacity-0 group-hover:opacity-100 transition-opacity">
      Login Now <LuArrowRight className="ml-2" />
    </div>
  </Link>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">Hospi!</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-700">
          Your hospital management system starts here.
        </p>

        {/* --- Card Section --- */}
        <div className="mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-8">
          <InfoCard
            title="Doctors"
            description="Manage your hospitals doctors efficiently."
            href="/login/doctorlogin"
            icon={LuStethoscope}
          />

          <InfoCard
            title="Patients"
            description="Keep track of patient records and history."
            href="/login/patientlogin"
            icon={LuUser}
          />

          <InfoCard
            title="Admin"
            description="Manage system settings and staff access."
            href="/login/adminlogin"
            icon={LuShieldCheck}
          />
        </div>
      </main>
    </div>
  );
}