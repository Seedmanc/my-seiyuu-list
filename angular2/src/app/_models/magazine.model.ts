interface Issue {
  issue: string;
  seiyuus: string[];
}

export class Magazine {
  magazine: string;
  issues: Issue[];

  get logo(): string {
    return this.magazine.toLowerCase().replace(/\s+/g, '_');
  }

  constructor(magazine: string, issues: any[]) {
    this.magazine = magazine.replace(':', '');

    this.issues = issues.map(issue => ({
      ...issue,
        seiyuus: issue.seiyuus
          .split(', ')
          .filter(seiyuu => seiyuu && !seiyuu.includes('"'))
          .map(s => s.trim())
          .sort()
      })
    );
  }

}
