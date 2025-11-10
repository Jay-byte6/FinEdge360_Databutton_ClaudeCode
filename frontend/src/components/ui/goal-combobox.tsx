import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export interface GoalOption {
  label: string;
  value: string;
  description?: string;
  typicalAmount?: string;
  typicalYears?: string;
}

interface GoalComboboxProps {
  options: GoalOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function GoalCombobox({
  options,
  value,
  onChange,
  placeholder = "Select or type a goal...",
  className,
}: GoalComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  // Update input value when prop value changes
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Filter options based on input
  const filteredOptions = (options || []).filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(inputValue.toLowerCase()))
  );

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn("pr-10", className)}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search goals..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="p-4 text-sm">
                    <p className="font-medium">No matching goals found</p>
                    <p className="text-gray-500 mt-1">You can still type your custom goal above</p>
                  </div>
                </CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.label)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-2 w-full">
                        <Check
                          className={cn(
                            "mt-1 h-4 w-4 shrink-0",
                            value === option.label ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                          )}
                          {(option.typicalAmount || option.typicalYears) && (
                            <div className="flex gap-3 mt-1 text-xs text-gray-400">
                              {option.typicalAmount && <span>💰 {option.typicalAmount}</span>}
                              {option.typicalYears && <span>⏰ {option.typicalYears}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
