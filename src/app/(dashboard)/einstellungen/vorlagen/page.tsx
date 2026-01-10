'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Construction } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vorlagen</h1>
        <p className="text-muted-foreground">
          Angebotsvorlagen und Textbausteine verwalten.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" />
            In Entwicklung
          </CardTitle>
          <CardDescription>
            Die Vorlagenverwaltung befindet sich noch in der Entwicklung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground max-w-md">
              Hier werden Sie zukünftig Angebotsvorlagen, Anschreiben-Texte,
              AGB-Verweise und Standardklauseln verwalten können.
            </p>
            <ul className="mt-6 text-sm text-muted-foreground space-y-2 text-left">
              <li>• Anschreiben-Vorlagen (kurz, standard, ausführlich)</li>
              <li>• Standard-Ausschlüsse und Annahmen</li>
              <li>• AGB-Verweise und rechtliche Hinweise</li>
              <li>• Textbausteine für häufige Leistungen</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
