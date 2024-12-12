import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
// import { useSearchParams } from "react-router-dom";


const courses = [
  { id: 1, name: "Introduction to React", instructor: "John Doe", status: "Active", students: 50 },
  { id: 2, name: "Advanced JavaScript", instructor: "Jane Smith", status: "Draft", students: 0 },
  { id: 3, name: "Web Design Fundamentals", instructor: "Alice Johnson", status: "Archived", students: 75 },
  { id: 4, name: "Python for Beginners", instructor: "Bob Wilson", status: "Active", students: 100 },
  { id: 5, name: "Data Structures and Algorithms", instructor: "Eve Brown", status: "Active", students: 80 },
]

export default function ActivitiesPage() {
  // const [searchParams] = useSearchParams();
  // const type = searchParams.get("type");
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-gray-500" />
          <Input
            placeholder="Search courses..."
            // value=}
            // onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select 
        // value={statusFilter} onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Students</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.name}</TableCell>
              <TableCell>{course.instructor}</TableCell>
              <TableCell>{course.status}</TableCell>
              <TableCell>{course.students}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-6">
        <Button variant="outline" className="mx-2">
          Previous
        </Button>
        <Button variant="outline" className="mx-2">
          Next
        </Button>
      </div>
    </div>
  );
}
