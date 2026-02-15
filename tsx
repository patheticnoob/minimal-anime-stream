import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InfoModalHeaderProps {
  anime: any;
  episodeCount: number;
  onPlayFirst: () => void;
}

export function InfoModalHeader({ anime, episodeCount, onPlayFirst }: InfoModalHeaderProps) {
  // ...
}