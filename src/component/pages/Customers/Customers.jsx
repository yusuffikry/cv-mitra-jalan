import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Pagination,
} from "flowbite-react";
import { Link } from "react-router-dom";
import { useState } from "react";
export default function Customers() {
  const [currentPage, setCurrentPage] = useState(1);
  const onPageChange = (page) => setCurrentPage(page);
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center pb-5 md:justify-end gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Cari data..."
          />
        </div>
        <Button color="green" href="/carlist/create">
          <span className="flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah
          </span>
        </Button>
      </div>
      <div className="space-y-4 bg-white p-2 rounded-lg">
        <div className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm">
          <Table hoverable>
            <TableHead>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                NO
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                NAMA PELANGAN
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                NIK
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                KONTAK
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                KOTA
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                KOTA RENTAL
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                STATUS
              </TableHeadCell>
              <TableHeadCell className="!bg-gray-100 !text-gray-600 border-b border-gray-200 uppercase text-xs font-bold">
                ACTION
              </TableHeadCell>
            </TableHead>
            <TableBody className="divide-y divide-gray-100">
              <TableRow className="!bg-white hover:!bg-gray-50 transition-colors">
                <TableCell className="text-gray-600">1</TableCell>
                <TableCell className="text-gray-600">CR-001</TableCell>
                <TableCell className="text-gray-600">Avanza</TableCell>
                <TableCell className="text-gray-900">Toyota</TableCell>
                <TableCell className="text-gray-600">DD 123 CC</TableCell>
                <TableCell className="text-gray-600">MANUAL</TableCell>
                <TableCell className="text-gray-600">300.000</TableCell>
                <TableCell>
                  <a
                    href="#"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Edit
                  </a>
                  <a
                    href="#"
                    className="font-semibold text-red-600 hover:underline ml-2"
                  >
                    Hapus
                  </a>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex justify-center md:justify-end border-t !border-gray-100 !bg-white px-4 py-3">
            <div className="flex overflow-x-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={100}
                onPageChange={onPageChange}
                showIcons
                theme={{
                  pages: {
                    base: "xs:mt-0 mt-2 inline-flex items-center -space-x-px",
                    showIcon: "inline-flex",
                    list: "inline-flex items-center -space-x-px",
                    selector: {
                      base: "w-10 border !border-gray-200 !bg-white py-2 leading-tight !text-gray-500 enabled:hover:!bg-gray-100 enabled:hover:!text-gray-700",
                      active:
                        "!bg-blue-50 !text-blue-600 hover:!bg-blue-100 hover:!text-blue-700 !border-blue-200 z-10",
                      disabled: "opacity-50 cursor-not-allowed",
                    },
                    button: {
                      base: "border !border-gray-200 !bg-white py-2 px-3 leading-tight !text-gray-500 enabled:hover:!bg-gray-100 enabled:hover:!text-gray-700",
                      active: "!bg-blue-50 !text-blue-600 !border-blue-200",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
