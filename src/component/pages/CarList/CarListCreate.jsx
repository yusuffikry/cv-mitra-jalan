import { Button, Card, Label, TextInput } from "flowbite-react";
export default function CarListCreate() {
  return (
    <div>
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        {/* Card dari Flowbite */}
        <Card className="w-full max-w-md shadow-sm border-gray-100 rounded-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                Tambah Mobil Baru
              </h3>
              <p className="text-sm text-gray-500">
                Masukkan detail informasi armada CV Mitra Jalan
              </p>
            </div>
            <form className="flex flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="car_name" value="Nama Mobil" />
                </div>
                <TextInput
                  id="car_name"
                  placeholder="Contoh: Avanza Veloz"
                  required
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="plate" value="Nomor Plat" />
                </div>
                <TextInput id="plate" placeholder="DD 1234 XX" required />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button color="gray" className="rounded-lg">
                  Batal
                </Button>
                <Button color="blue" className="bg-[#5493ff] rounded-lg">
                  Simpan Data
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
