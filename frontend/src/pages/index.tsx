import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import {
  Card, CardHeader, CardBody, Checkbox, CheckboxGroup,
  Modal, ModalContent, ModalHeader, ModalBody,
  Input, Button, Chip, Divider, Link, useDisclosure
} from "@nextui-org/react"
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-left gap-4 py-8 md:py-10">
        {/* <div>
          <h1 className={title()}>Пет-проект "<span className={title({ color: "violet" })}>Insecure App</span>"</h1>
          <br/>
          <br/>
          <h2>Обязательно понимание:</h2>
          <br/>
          <Chip color="primary" variant="flat">React</Chip>
          <span> </span>
          <Chip color="primary" variant="flat">API</Chip>
          <br/>
          <br/>
          <h6>Знание (на выбор):</h6>
          <br/>
          <Chip color="primary" variant="flat">Python (django, flask)</Chip>
          <span> </span>
          <Chip color="primary" variant="flat">Go</Chip>
          <span> </span>
          <Chip color="primary" variant="flat">Java (spring)</Chip>
          <span> </span>
          <Chip color="primary" variant="flat">Js</Chip>
          <span> </span>
          <Chip color="primary" variant="flat">Ts</Chip>
          <br/>
          <br/>
          <hr/>
          <br/>
          <h2>Очень приветствуется:</h2>
          <br/>
          <Chip color="secondary" variant="flat">Docker</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">k8s</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">Vagrant</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">Ansible</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">PostgreSQL</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">SAST</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">DAST</Chip>
          <span> </span>
          <Chip color="secondary" variant="flat">Nginx</Chip>
        </div> */}
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Build&nbsp;</span>
          <span className={title({ color: "violet" })}>secure&nbsp;</span>
          <br />
          <span className={title()}>
            And unhackable apps.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            use Insecure app for practice
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.docs}
          >
            Documentation
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.github}
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Get started by running{" "}
              <Code color="primary">Dockerfile</Code>
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
