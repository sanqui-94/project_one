/// <reference path="components/project-list.ts" />
/// <reference path="components/project-input.ts" />

namespace App {
  // Actually use the stuff defined above
  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
