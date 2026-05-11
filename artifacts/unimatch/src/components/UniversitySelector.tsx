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
import SchoolLogo from "@/components/SchoolLogo";

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
            <div className="flex min-w-0 items-center gap-2">
              <SchoolLogo
                id={selectedUni.id}
                name={selectedUni.name}
                color={selectedUni.color}
                size={28}
                rounded="lg"
                className="bg-background"
              />
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-black">{selectedUni.shortName}</div>
                <div className="hidden truncate text-[11px] font-semibold text-muted-foreground sm:block">
                  {selectedUni.location}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(360px,calc(100vw-2rem))] p-0 bg-card/95 backdrop-blur-xl border-border">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search university..." className="border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>No university found.</CommandEmpty>
            <CommandGroup>
              {universities.map((uni) => (
                <CommandItem
                  key={uni.id}
                  value={`${uni.name} ${uni.shortName} ${uni.location}`}
                  onSelect={() => {
                    onChange(uni.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-3 px-3 py-3 aria-selected:bg-muted/50"
                >
                  <SchoolLogo
                    id={uni.id}
                    name={uni.name}
                    color={uni.color}
                    size={38}
                    rounded="lg"
                    className="bg-background"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{uni.name}</div>
                    <div className="truncate text-xs font-semibold text-muted-foreground">{uni.location}</div>
                  </div>
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
