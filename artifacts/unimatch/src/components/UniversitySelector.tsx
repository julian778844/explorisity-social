import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { universities } from "@/data/universities";

interface UniversitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function UniversitySelector({ value, onChange, placeholder = "Select university..." }: UniversitySelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedUni = universities.find((u) => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card border-border hover:bg-muted hover:text-foreground"
        >
          {selectedUni ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedUni.color }}
              />
              {selectedUni.shortName}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-card/95 backdrop-blur-xl border-border">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search university..." className="border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            <CommandGroup>
              {universities.map((uni) => (
                <CommandItem
                  key={uni.id}
                  value={uni.name}
                  onSelect={() => {
                    onChange(uni.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer aria-selected:bg-muted/50"
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: uni.color }}
                  />
                  {uni.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 text-primary",
                      value === uni.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
