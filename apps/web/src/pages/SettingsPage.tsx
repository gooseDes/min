import Translation from "@/translation";
import ClickableProfile from "@components/ClickableProfile";
import IconButton from "@components/IconButton";
import LeftPart from "@components/LeftPart";
import RightPart from "@components/RightPart";
import { faArrowLeft, faCog, faListUl, faSliders } from "@fortawesome/free-solid-svg-icons";
import useNavigation from "@hooks/useNavigation";
import useTranslation from "@hooks/useTranslation";
import { openDropdown } from "@services/dropdownService";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./SettingsPage.module.scss";

export type SettingsTab = "none" | "general";

const tabs: SettingsTab[] = ["general"];

const motionInitial: TargetAndTransition = { opacity: 0, scale: 0 };
const motionAnimate: TargetAndTransition = { opacity: 1, scale: 1 };
const motionExit: TargetAndTransition = { opacity: 0, scale: 0 };

function SettingsPage() {
  const navigate = useNavigation();
  const { t, changeLanguage } = useTranslation();

  const [currentTab, setCurrentTab] = useState<SettingsTab>("none");

  const leftPartRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.main}>
      <LeftPart headerIcon={faCog} headerTitle={t.settings} ref={leftPartRef}>
        {tabs.map(tab => (
          <ClickableProfile
            key={tab}
            icon={faSliders}
            text={t[`settings_${tab}` as keyof typeof t]}
            isInList
            onClick={() => {
              setCurrentTab(tab);
              leftPartRef.current?.classList.add(styles.mobileHidden);
            }}
          />
        ))}
        <div style={{ flex: 1 }} />
        <ClickableProfile icon={faArrowLeft} onClick={() => navigate("/")} />
      </LeftPart>
      <RightPart
        top={
          currentTab !== "none" && (
            <motion.div
              className={styles.titleContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <IconButton
                icon={faListUl}
                size={24}
                className={styles.closeButton}
                onClick={() => leftPartRef.current?.classList.remove(styles.mobileHidden)}
              />
              <AnimatePresence mode="wait">
                <motion.h1 initial={motionInitial} animate={motionAnimate} exit={motionExit} key={currentTab}>
                  {t[`settings_${currentTab}` as keyof typeof t]}
                </motion.h1>
              </AnimatePresence>
              <div className={styles.closeButton} />
            </motion.div>
          )
        }
      >
        {/* Tabs Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {/* General */}
            {currentTab === "general" && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={motionInitial}
                animate={motionAnimate}
                exit={motionExit}
                className={styles.changeLanguageButton}
                onClick={e =>
                  openDropdown({
                    title: t.language,
                    items: [
                      {
                        label: Translation.en.language_name,
                        onPress: () => changeLanguage("en"),
                      },
                      {
                        label: Translation.ru.language_name,
                        onPress: () => changeLanguage("ru"),
                      },
                      {
                        label: Translation.ua.language_name,
                        onPress: () => changeLanguage("ua"),
                      },
                    ],
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
              >
                {t.change_language}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </RightPart>
    </div>
  );
}

export default SettingsPage;
