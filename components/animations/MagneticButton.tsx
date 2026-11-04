'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { Slot } from '@radix-ui/react-slot';

interface MagneticButtonProps extends Omit<ButtonProps, 'children' | 'onMouseMove' | 'onMouseLeave' | 'onMouseEnter'> {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  rotateStrength?: number;
  className?: string;
}

export function MagneticButton({
  children,
  strength = 0.3,
  maxDistance = 80,
  rotateStrength = 3,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * strength;
        const moveX = deltaX * force;
        const moveY = deltaY * force;
        const rotation = (deltaX / (rect.width / 2)) * rotateStrength * force;

        setPosition({ x: moveX, y: moveY, rotate: rotation });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0, rotate: 0 });
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [strength, maxDistance, rotateStrength]);

  // Extract motion-specific props to avoid conflicts
  const { onAnimationStart, onAnimationComplete, whileHover, whileTap, asChild, ...restProps } = props as Record<string, unknown>;

  if (asChild) {
    return (
      <Slot
        ref={ref as any}
        className={cn('relative overflow-hidden', className)}
        {...(restProps as any)}
      >
        {children}
      </Slot>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotate}deg)`,
        willChange: 'transform',
      }}
      whileHover={{ scale: 1.02, y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      {...restProps}
    >
      <span className="relative z-10 flex items-center justify-center">{children}</span>
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)]/10 to-[var(--color-gold)]/5 rounded-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

interface MagneticCardProps {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  rotateStrength?: number;
  className?: string;
  onClick?: () => void;
}

export function MagneticCard({
  children,
  strength = 0.15,
  maxDistance = 100,
  rotateStrength = 2,
  className,
  onClick,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * strength;
        const moveX = deltaX * force;
        const moveY = deltaY * force;
        const rotateY = (deltaX / (rect.width / 2)) * rotateStrength * force;
        const rotateX = -(deltaY / (rect.height / 2)) * rotateStrength * force;

        setPosition({ x: moveX, y: moveY, rotateX, rotateY });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, maxDistance, rotateStrength]);

  return (
    <motion.div
      ref={ref}
      className={cn('relative transform-gpu', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotateX(${position.rotateX}deg) rotateY(${position.rotateY}deg)`,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      onClick={onClick}
    >
      <div className="relative z-10">{children}</div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent rounded-inherit pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: position.x !== 0 || position.y !== 0 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

interface MagneticIconProps {
  children: React.ReactNode;
  strength?: number;
  maxDistance?: number;
  className?: string;
  onClick?: () => void;
}

export function MagneticIcon({
  children,
  strength = 0.5,
  maxDistance = 60,
  className,
  onClick,
}: MagneticIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * strength;
        setPosition({ x: deltaX * force, y: deltaY * force, scale: 1 + force * 0.3 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0, scale: 1 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength, maxDistance]);

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex items-center justify-center transform-gpu', className)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
        willChange: 'transform',
      }}
      whileTap={{ scale: 0.9, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}